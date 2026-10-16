import Button from '../../components/Button/Button';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import MessageDialog from '../../components/MessageDialog/MessageDialog';
import RecipeInput from '../../components/RecipeInput/RecipeInput';
import RecipeQuestions from '../../components/RecipeQuestions/RecipeQuestions';
import { useNewRecipeFlow } from '../../hooks/useNewRecipeFlow';

export default function NewRecipe() {
  const flow = useNewRecipeFlow();
  const { modal } = flow;

  return (
    <>
      {flow.step === 'input' && (
        <RecipeInput
          text={flow.text}
          onTextChange={flow.setText}
          onBack={flow.backFromInput}
          onContinue={flow.submitText}
        />
      )}
      {flow.step === 'loading' && (
        // Keyed so the phrase sequence restarts for the second loading screen.
        <LoadingScreen key={flow.loadingFor} onCancel={flow.cancelLoading} />
      )}
      {flow.step === 'questions' && (
        <RecipeQuestions
          question={flow.questions[flow.index]}
          index={flow.index}
          total={flow.questions.length}
          answer={flow.answers[flow.index]}
          onAnswerChange={flow.setAnswer}
          onBack={flow.backFromQuestion}
          onSkip={flow.skip}
          onContinue={flow.continueFromQuestion}
        />
      )}

      <MessageDialog
        open={modal?.type === 'unusable'}
        onClose={flow.dismissModal}
        variant="warning"
        title="Wait a second..."
        actions={
          <Button variant="primary" onClick={flow.dismissModal}>
            continue
          </Button>
        }
      >
        <p>{modal?.type === 'unusable' ? modal.reason : ''}</p>
      </MessageDialog>

      <MessageDialog
        open={modal?.type === 'error'}
        onClose={flow.dismissError}
        variant="error"
        title="Oops"
        actions={
          <Button variant="primary" onClick={flow.retry}>
            try again
          </Button>
        }
      >
        <p>That didn't quite work.</p>
        <p>{modal?.type === 'error' ? modal.message : ''}</p>
      </MessageDialog>

      <MessageDialog
        open={flow.leaveOpen}
        onClose={flow.closeLeave}
        variant="warning"
        title="Are you sure?"
        actions={
          <>
            <Button variant="outline" onClick={flow.closeLeave}>
              cancel
            </Button>
            <Button variant="destructive" onClick={flow.discard}>
              discard
            </Button>
          </>
        }
      >
        <p>This recipe isn't saved yet. If you leave now, it will be lost.</p>
      </MessageDialog>

      <MessageDialog
        open={modal?.type === 'backToInput'}
        onClose={flow.dismissModal}
        variant="warning"
        title="Are you sure?"
        actions={
          <>
            <Button variant="outline" onClick={flow.dismissModal}>
              cancel
            </Button>
            <Button variant="destructive" onClick={flow.confirmBackToInput}>
              go back
            </Button>
          </>
        }
      >
        <p>Going back means your answers will be lost and new questions will be generated.</p>
      </MessageDialog>
    </>
  );
}
