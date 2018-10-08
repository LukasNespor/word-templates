import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogType, DialogFooter } from "office-ui-fabric-react/lib/Dialog";
import { PrimaryButton, DefaultButton } from "office-ui-fabric-react/lib/Button";

export class ConfirmDialog extends Component {
  render() {
    return (
      <Dialog
        dialogContentProps={{
          type: DialogType.normal,
          title: "Potvrzení smazání",
          subText: this.props.question
        }}
        hidden={false}
        modalProps={{ isOpen: true, isBlocking: true }}
        onDismiss={this.props.onDismissed}
      >

        <DialogFooter>
          <PrimaryButton text="Ano" default={true} onClick={this.props.onConfirmed} />
          <DefaultButton text="Ne" onClick={this.props.onDismissed} />
        </DialogFooter>
      </Dialog>
    );
  }
}

ConfirmDialog.propTypes = {
  question: PropTypes.string.isRequired,
  onConfirmed: PropTypes.func.isRequired,
  onDismissed: PropTypes.func.isRequired
}