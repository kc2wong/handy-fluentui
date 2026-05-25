import { useContext } from 'react';

import { FuiDialogContext } from '@context/dialog-context';

/** Returns the dialog context handle. Call openDialog() to show a confirmation dialog. */
const useDialog = () => useContext(FuiDialogContext);

export { useDialog };
