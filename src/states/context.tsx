import { createContext, useContext, useState } from 'react';

import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';

// Keep readers separate from writers so, for example, log updates do not rerender AppInit.
export const createStateContext = <T,>(name: string, initialValue: () => T) => {
  const missingProvider = Symbol(name);
  const ValueContext = createContext<T | typeof missingProvider>(missingProvider);
  const SetterContext = createContext<Dispatch<SetStateAction<T>> | undefined>(undefined);

  const Provider = ({ children }: PropsWithChildren) => {
    const [value, setValue] = useState<T>(initialValue);
    return (
      <SetterContext.Provider value={setValue}>
        <ValueContext.Provider value={value}>{children}</ValueContext.Provider>
      </SetterContext.Provider>
    );
  };
  Provider.displayName = `${name}Provider`;

  const useValue = () => {
    const value = useContext(ValueContext);
    if (value === missingProvider) throw new Error(`${name}Provider is missing`);
    return value as T;
  };

  const useSetter = () => {
    const setter = useContext(SetterContext);
    if (!setter) throw new Error(`${name}Provider is missing`);
    return setter;
  };

  return [Provider, useValue, useSetter] as const;
};
