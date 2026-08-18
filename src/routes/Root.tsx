import { useState } from 'react';

export default function Root() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(JSON.stringify(data));
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  const [recipeText, setRecipeText] = useState('');
  const [answersJson, setAnswersJson] = useState(
    '[\n  { "question": "", "answer": "" }\n]',
  );
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [recipeResult, setRecipeResult] = useState<unknown>(null);

  async function handleRecipeSubmit() {
    setRecipeLoading(true);
    setRecipeError(null);
    setRecipeResult(null);
    try {
      const answers = JSON.parse(answersJson);
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: recipeText, answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRecipeError(JSON.stringify(data));
      } else {
        setRecipeResult(data);
      }
    } catch (err) {
      setRecipeError(String(err));
    } finally {
      setRecipeLoading(false);
    }
  }

  return (
    <div>
      <h1>generate-questions test</h1>
      <textarea
        rows={10}
        cols={60}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <br />
      <button onClick={handleSubmit} disabled={loading || !text.trim()}>
        {loading ? 'Loading...' : 'Submit'}
      </button>
      {error && <p>Error: {error}</p>}
      {result != null && <pre>{JSON.stringify(result, null, 2)}</pre>}

      <h1>generate-recipe test</h1>
      <textarea
        rows={10}
        cols={60}
        placeholder="original account text"
        value={recipeText}
        onChange={(e) => setRecipeText(e.target.value)}
      />
      <br />
      <textarea
        rows={10}
        cols={60}
        placeholder='answers as JSON array of { "question", "answer" }'
        value={answersJson}
        onChange={(e) => setAnswersJson(e.target.value)}
      />
      <br />
      <button
        onClick={handleRecipeSubmit}
        disabled={recipeLoading || !recipeText.trim()}
      >
        {recipeLoading ? 'Loading...' : 'Submit'}
      </button>
      {recipeError && <p>Error: {recipeError}</p>}
      {recipeResult != null && (
        <pre>{JSON.stringify(recipeResult, null, 2)}</pre>
      )}
    </div>
  );
}
