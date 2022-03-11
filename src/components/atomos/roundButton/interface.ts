import React from 'react';

export interface RoundButtonProps {
  color: 'primary' | 'accent' | 'danger' | 'excel';
  disabled?: boolean;
  onClick?(): React.MouseEvent<HTMLInputElement>;
}
