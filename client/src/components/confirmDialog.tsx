import { FunctionComponent } from "react";
import {
  Dialog, DialogType, DialogFooter,
  PrimaryButton, DefaultButton
} from "@fluentui/react";

export interface IConfirmDialogProps {
  onConfirmed: () => void;
  onDismissed: () => void;
}

export const ConfirmDialog: FunctionComponent<IConfirmDialogProps> = ({ onConfirmed, onDismissed }) => {
  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: "Potvrzení odstranění",
        subText: "Opravdu si přejete šablonu odstranit?"
      }}
      hidden={false}
      modalProps={{ isOpen: true, isBlocking: false }}
      onDismiss={onDismissed}
    >

      <DialogFooter>
        <PrimaryButton text="Ano" default={true} onClick={onConfirmed} />
        <DefaultButton text="Ne" onClick={onDismissed} />
      </DialogFooter>
    </Dialog>
  );
};

export default ConfirmDialog;
