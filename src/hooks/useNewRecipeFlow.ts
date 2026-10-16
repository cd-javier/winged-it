import { useCallback, useEffect, useRef, useState } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';

import { ApiError, generateQuestions, generateRecipe } from '../lib/api';
import { addRecipe } from '../lib/recipes';
import type { Recipe } from '../types/recipe';

export const FINAL_QUESTION = "Do you wish you'd done anything differently?";

type Step = 'input' | 'loading' | 'questions';
type LoadingFor = 'questions' | 'recipe';
type RetryTarget = 'questions' | 'recipe' | 'save';

export type FlowModal =
  | { type: 'unusable'; reason: string }
  | { type: 'error'; message: string; retry: RetryTarget }
  | { type: 'backToInput' };

function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === 'AbortError';
}

/**
 * All state and actions of the new recipe flow. One component owns it and passes props
 * down, so no context or reducer is needed.
 */
export function useNewRecipeFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('input');
  const [loadingFor, setLoadingFor] = useState<LoadingFor>('questions');
  const [text, setText] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [modal, setModal] = useState<FlowModal | null>(null);
  const [leaveRequested, setLeaveRequested] = useState(false);

  const controllerRef = useRef<AbortController | null>(null);
  // A ref, not state: it must be set synchronously right before our own navigation.
  const allowLeaveRef = useRef(false);
  // Kept so a failed save can be retried without calling Gemini again.
  const pendingRecipeRef = useRef<Omit<Recipe, 'id'> | null>(null);

  const hasContent = text.trim() !== '';
  const blocker = useBlocker(() => hasContent && !allowLeaveRef.current);
  const leaveOpen = leaveRequested || blocker.state === 'blocked';

  // Warn on closing or reloading the tab, only while there is something to lose.
  useEffect(() => {
    if (!hasContent) return;
    const handler = (event: BeforeUnloadEvent) => {
      if (allowLeaveRef.current) return;
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasContent]);

  // Aborts a request that is still running if the user leaves the route.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const closeLeave = useCallback(() => {
    setLeaveRequested(false);
    if (blocker.state === 'blocked') blocker.reset();
  }, [blocker]);

  const startController = () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return controller;
  };

  const showError = (err: unknown, retry: RetryTarget) => {
    // ApiError messages are already friendly. Anything else gets the generic one.
    const message = (err instanceof ApiError ? err : new ApiError('generic')).message;
    closeLeave();
    setModal({ type: 'error', message, retry });
  };

  const saveAndLeave = async (recipe: Omit<Recipe, 'id'>) => {
    try {
      const saved = await addRecipe(recipe);
      pendingRecipeRef.current = null;
      allowLeaveRef.current = true;
      navigate(`/recipe/${saved.id}`, { replace: true });
    } catch (err) {
      pendingRecipeRef.current = recipe;
      showError(err, 'save');
    }
  };

  const requestQuestions = async () => {
    const controller = startController();
    setLoadingFor('questions');
    setStep('loading');
    try {
      const result = await generateQuestions(text, { signal: controller.signal });
      if (controller.signal.aborted) return;
      closeLeave();
      if (!result.usable) {
        setStep('input');
        setModal({ type: 'unusable', reason: result.reason });
        return;
      }
      const list = [...result.questions.map((q) => q.question), FINAL_QUESTION];
      setQuestions(list);
      setAnswers(list.map(() => ''));
      setIndex(0);
      setStep('questions');
    } catch (err) {
      if (isAbortError(err) || controller.signal.aborted) return;
      showError(err, 'questions');
    }
  };

  const requestRecipe = async (finalAnswers: string[]) => {
    const controller = startController();
    setLoadingFor('recipe');
    setStep('loading');
    try {
      const pairs = questions.map((question, i) => ({ question, answer: finalAnswers[i] ?? '' }));
      const recipe = await generateRecipe(text, pairs, { signal: controller.signal });
      if (controller.signal.aborted) return;
      closeLeave();
      await saveAndLeave(recipe);
    } catch (err) {
      if (isAbortError(err) || controller.signal.aborted) return;
      showError(err, 'recipe');
    }
  };

  const advance = (nextAnswers: string[]) => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      void requestRecipe(nextAnswers);
    }
  };

  const setAnswer = (answer: string) => {
    setAnswers((current) => current.map((a, i) => (i === index ? answer : a)));
  };

  const skip = () => {
    const next = answers.map((a, i) => (i === index ? '' : a));
    setAnswers(next);
    advance(next);
  };

  const continueFromQuestion = () => advance(answers);

  const backFromQuestion = () => {
    if (index > 0) {
      setIndex(index - 1);
    } else {
      setModal({ type: 'backToInput' });
    }
  };

  const confirmBackToInput = () => {
    setModal(null);
    setQuestions([]);
    setAnswers([]);
    setIndex(0);
    setStep('input');
  };

  // With text this goes through the blocker and shows the leave modal; with none it goes Home.
  const backFromInput = () => navigate('/');

  const cancelLoading = () => setLeaveRequested(true);

  const discard = () => {
    controllerRef.current?.abort();
    allowLeaveRef.current = true;
    setLeaveRequested(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
    } else {
      navigate('/');
    }
  };

  const dismissModal = () => setModal(null);

  /** Esc or backdrop on the error modal: return to the screen before the failed call. */
  const dismissError = () => {
    if (modal?.type !== 'error') return;
    pendingRecipeRef.current = null;
    setModal(null);
    setStep(modal.retry === 'questions' ? 'input' : 'questions');
  };

  const retry = () => {
    if (modal?.type !== 'error') return;
    const target = modal.retry;
    setModal(null);
    if (target === 'questions') {
      void requestQuestions();
    } else if (target === 'recipe') {
      void requestRecipe(answers);
    } else if (pendingRecipeRef.current) {
      void saveAndLeave(pendingRecipeRef.current);
    }
  };

  return {
    step,
    loadingFor,
    text,
    questions,
    answers,
    index,
    modal,
    leaveOpen,
    setText,
    submitText: () => void requestQuestions(),
    backFromInput,
    cancelLoading,
    setAnswer,
    skip,
    continueFromQuestion,
    backFromQuestion,
    confirmBackToInput,
    dismissModal,
    dismissError,
    retry,
    closeLeave,
    discard,
  };
}
