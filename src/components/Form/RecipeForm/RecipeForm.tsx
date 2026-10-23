import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { useLeaveGuard } from '../../../hooks/useLeaveGuard';
import { useNutritionCalculation } from '../../../hooks/useNutritionCalculation';
import { useRecipeForm } from '../../../hooks/useRecipeForm';
import { ApiError } from '../../../lib/api';
import type { FormValues } from '../../../lib/recipeForm';
import type { Recipe } from '../../../types/recipe';
import Button from '../../Button/Button';
import ErrorDialog from '../../ErrorDialog/ErrorDialog';
import LoadingDialog from '../../LoadingDialog/LoadingDialog';
import MessageDialog from '../../MessageDialog/MessageDialog';
import NutritionTable from '../../NutritionTable/NutritionTable';
import Field from '../Field/Field';
import IngredientRow from '../IngredientRow/IngredientRow';
import PhotoField from '../PhotoField/PhotoField';
import StepRow from '../StepRow/StepRow';
import TextArea from '../TextArea/TextArea';
import TextInput from '../TextInput/TextInput';
import styles from './RecipeForm.module.css';

const NOTE_WITHOUT_VALUES =
  "Optional. Once you've added your ingredients, steps and servings, we can estimate the nutritional values per serving.";
const NOTE_WITH_VALUES =
  'Approximate values per serving, estimated by AI. Recalculate if you change anything.';

// Focus target for a failed save: resolved after the re-render that shows the errors.
const FIRST_INVALID = 'first-invalid';

interface RecipeFormProps {
  heading: string;
  initialValues: FormValues;
  /** Saves the recipe and returns what to do next (the navigation). That runs after the leave guard is released, so a saved form never asks "are you sure?". */
  onSubmit: (data: Omit<Recipe, 'id'>) => Promise<() => void>;
  /** Leaves the form without saving. */
  onCancel: () => void;
}

export default function RecipeForm({ heading, initialValues, onSubmit, onCancel }: RecipeFormProps) {
  const form = useRecipeForm(initialValues);
  const guard = useLeaveGuard(form.dirty);
  const calculation = useNutritionCalculation({
    values: form.values,
    baseline: form.baseline,
    onResult: form.setNutrition,
  });
  const { values, errors } = form;

  const formRef = useRef<HTMLFormElement>(null);
  // What to focus after the next render: a CSS selector, or FIRST_INVALID. A ref, because focusing must wait for the render but must not cause one.
  const pendingFocusRef = useRef<string | null>(null);
  // Kept so "try again" retries the save only.
  const pendingDataRef = useRef<Omit<Recipe, 'id'> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  // useId gives each section error an id, so invalid rows can point at it.
  const idPrefix = useId();
  const ingredientsErrorId = `${idPrefix}-ingredients-error`;
  const stepsErrorId = `${idPrefix}-steps-error`;

  const focusFirstInvalid = () => {
    const root = formRef.current;
    if (!root) return;
    // With no rows left there is no invalid control, so land on the add button of the empty section.
    const fallback = errors.ingredients && values.ingredients.length === 0 ? 'ingredient' : 'step';
    (
      root.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      root.querySelector<HTMLElement>(`[data-add="${fallback}"]`)
    )?.focus();
  };

  // Runs after every render, and only acts when something asked for focus.
  useEffect(() => {
    const target = pendingFocusRef.current;
    if (!target) return;
    pendingFocusRef.current = null;
    if (target === FIRST_INVALID) {
      focusFirstInvalid();
    } else {
      formRef.current?.querySelector<HTMLElement>(target)?.focus();
    }
  });

  const firstInputOf = (rowKey: string) => `[data-row-key="${rowKey}"] :is(input, textarea)`;

  const addIngredient = () => {
    pendingFocusRef.current = firstInputOf(form.addIngredient());
  };

  const removeIngredient = (key: string) => {
    const index = values.ingredients.findIndex((row) => row.key === key);
    const next = values.ingredients[index + 1];
    pendingFocusRef.current = next ? firstInputOf(next.key) : '[data-add="ingredient"]';
    form.removeIngredient(key);
  };

  const addStep = () => {
    pendingFocusRef.current = firstInputOf(form.addStep());
  };

  const removeStep = (key: string) => {
    const index = values.steps.findIndex((step) => step.key === key);
    const next = values.steps[index + 1];
    pendingFocusRef.current = next ? firstInputOf(next.key) : '[data-add="step"]';
    form.removeStep(key);
  };

  const save = async (data: Omit<Recipe, 'id'>) => {
    setSaving(true);
    try {
      const next = await onSubmit(data);
      guard.allowLeave();
      next();
    } catch {
      setSaving(false);
      setSaveFailed(true);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    const data = form.submit();
    if (!data) {
      if (form.submitted) {
        focusFirstInvalid();
      } else {
        // The errors appear with the next render, so focus after it.
        pendingFocusRef.current = FIRST_INVALID;
      }
      return;
    }
    pendingDataRef.current = data;
    void save(data);
  };

  const retrySave = () => {
    setSaveFailed(false);
    if (pendingDataRef.current) void save(pendingDataRef.current);
  };

  const handleCancel = () => {
    if (form.dirty) guard.requestLeave();
    else onCancel();
  };

  const hasNutrition = Boolean(values.nutritionalInfo);

  return (
    <form ref={formRef} className={styles.form} noValidate onSubmit={handleSubmit}>
      <h1 className={styles.title}>{heading}</h1>

      <PhotoField image={values.image} onChange={form.setImage} />

      <Field label="Title" error={errors.title}>
        {(controlProps) => (
          <TextInput
            {...controlProps}
            placeholder="Name your recipe"
            autoComplete="off"
            value={values.title}
            onChange={(event) => form.setText('title', event.target.value)}
          />
        )}
      </Field>

      <Field label="Description (optional)">
        {(controlProps) => (
          <TextArea
            {...controlProps}
            autoGrow
            className={styles.description}
            placeholder="A short summary of the dish"
            value={values.description}
            onChange={(event) => form.setText('description', event.target.value)}
          />
        )}
      </Field>

      <div className={styles.numbers}>
        <Field label="Servings" size="small" error={errors.servings}>
          {(controlProps) => (
            <TextInput
              {...controlProps}
              className={styles.number}
              inputMode="numeric"
              autoComplete="off"
              value={values.servings}
              onChange={(event) => form.setText('servings', event.target.value)}
            />
          )}
        </Field>
        <Field label="Prep time (min)" size="small" error={errors.prepTime}>
          {(controlProps) => (
            <TextInput
              {...controlProps}
              className={styles.number}
              inputMode="numeric"
              autoComplete="off"
              value={values.prepTime}
              onChange={(event) => form.setText('prepTime', event.target.value)}
            />
          )}
        </Field>
        <Field label="Cook time (min)" size="small" error={errors.cookTime}>
          {(controlProps) => (
            <TextInput
              {...controlProps}
              className={styles.number}
              inputMode="numeric"
              autoComplete="off"
              value={values.cookTime}
              onChange={(event) => form.setText('cookTime', event.target.value)}
            />
          )}
        </Field>
      </div>

      <section className={styles.section}>
        <h2 className={styles.heading}>Ingredients</h2>
        {errors.ingredients && (
          <p id={ingredientsErrorId} className={styles.sectionError}>
            {errors.ingredients}
          </p>
        )}
        <ul className={styles.rows} role="list">
          {values.ingredients.map((row, index) => (
            <li key={row.key} data-row-key={row.key}>
              <IngredientRow
                number={index + 1}
                value={row}
                errors={errors.ingredientRows[row.key]}
                describedBy={ingredientsErrorId}
                onChange={(patch) => form.updateIngredient(row.key, patch)}
                onRemove={() => removeIngredient(row.key)}
              />
            </li>
          ))}
        </ul>
        <Button variant="secondary" fullWidth data-add="ingredient" onClick={addIngredient}>
          add ingredient
        </Button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Steps</h2>
        {errors.steps && (
          <p id={stepsErrorId} className={styles.sectionError}>
            {errors.steps}
          </p>
        )}
        <ul className={styles.rows} role="list">
          {values.steps.map((step, index) => (
            <li key={step.key} data-row-key={step.key}>
              <StepRow
                number={index + 1}
                text={step.text}
                invalid={Boolean(errors.stepRows[step.key])}
                describedBy={stepsErrorId}
                onChange={(text) => form.updateStep(step.key, text)}
                onRemove={() => removeStep(step.key)}
              />
            </li>
          ))}
        </ul>
        <Button variant="secondary" fullWidth data-add="step" onClick={addStep}>
          add step
        </Button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Nutritional info</h2>
        <p className={styles.note}>{hasNutrition ? NOTE_WITH_VALUES : NOTE_WITHOUT_VALUES}</p>
        {values.nutritionalInfo && (
          <div className={styles.table}>
            <NutritionTable nutritionalInfo={values.nutritionalInfo} showCaption={false} />
          </div>
        )}
        <Button
          variant="secondary"
          fullWidth
          disabled={!form.canCalculate}
          onClick={() => void calculation.start()}
        >
          {hasNutrition ? 'recalculate' : 'calculate'}
        </Button>
      </section>

      <div className={styles.actions}>
        <Button variant="outline" onClick={handleCancel}>
          cancel
        </Button>
        <Button type="submit" variant="primary" disabled={saving}>
          save
        </Button>
      </div>

      <LoadingDialog open={calculation.calculating} onCancel={calculation.cancel} />

      <ErrorDialog
        open={calculation.errorMessage !== null}
        message={calculation.errorMessage ?? ''}
        onRetry={() => void calculation.start()}
        onClose={calculation.dismissError}
      />

      <ErrorDialog
        open={saveFailed}
        message={new ApiError('generic').message}
        onRetry={retrySave}
        onClose={() => setSaveFailed(false)}
      />

      <MessageDialog
        open={guard.leaveOpen}
        onClose={guard.closeLeave}
        variant="warning"
        title="Are you sure?"
        actions={
          <>
            <Button variant="outline" onClick={guard.closeLeave}>
              cancel
            </Button>
            <Button variant="destructive" onClick={() => guard.discard(onCancel)}>
              discard
            </Button>
          </>
        }
      >
        <p>You haven't saved yet. If you leave now, the changes will be lost.</p>
      </MessageDialog>
    </form>
  );
}
