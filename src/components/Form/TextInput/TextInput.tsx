import type { ComponentPropsWithRef } from 'react';

import { controlClass } from '../Control/controlClass';
import type { ControlVariant } from '../Control/controlClass';

interface TextInputProps extends ComponentPropsWithRef<'input'> {
  variant?: ControlVariant;
}

export default function TextInput({ variant = 'box', className, ...props }: TextInputProps) {
  return <input className={controlClass(variant, className)} {...props} />;
}
