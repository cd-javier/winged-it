import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { resizeImage } from '../../../lib/resizeImage';
import IconButton from '../../IconButton/IconButton';
import { PencilIcon, TrashIcon } from '../../Icons/Icons';
import RecipeHero from '../../RecipeHero/RecipeHero';
import styles from './PhotoField.module.css';

interface PhotoFieldProps {
  /** The stored photo as a data URL. */
  image?: string;
  onChange: (image: string | undefined) => void;
}

export default function PhotoField({ image, onChange }: PhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const openPicker = () => inputRef.current?.click();

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    setError('');
    try {
      onChange(await resizeImage(file));
    } catch {
      setError("Sorry, we couldn't read that photo. Try another one.");
    } finally {
      // Lets the user pick the same file again after removing it.
      input.value = '';
    }
  };

  return (
    <div className={styles.field}>
      {image ? (
        <RecipeHero
          image={image}
          centre={
            <>
              <IconButton
                icon={<PencilIcon />}
                label="change photo"
                variant="overlay"
                size="compact"
                onClick={openPicker}
              />
              <IconButton
                icon={<TrashIcon />}
                label="remove photo"
                variant="overlay"
                size="compact"
                onClick={() => {
                  setError('');
                  onChange(undefined);
                }}
              />
            </>
          }
        />
      ) : (
        <button type="button" className={styles.empty} onClick={openPicker}>
          + add a photo (optional)
        </button>
      )}
      {/* Hidden: the buttons above open the picker. */}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
