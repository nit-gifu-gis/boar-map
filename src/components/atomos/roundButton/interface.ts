export interface RoundButtonProps {
  color: 'primary' | 'accent' | 'danger' | 'excel';
  disabled?: boolean;
  onClick?(): void;
}
