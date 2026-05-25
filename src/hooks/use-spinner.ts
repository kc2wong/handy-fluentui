import { useContext } from 'react';

import { FuiSpinnerContext } from '@context/spinner-context';

/** Returns show/hide handles for the global overlay spinner. */
const useSpinner = () => useContext(FuiSpinnerContext);

export { useSpinner };
