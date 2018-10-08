import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogType, DialogFooter, PrimaryButton, DefaultButton } from "office-ui-fabric-react";

export class ConfirmDialog extends Component {
  render() {
    return (
      <Dialog
        dialogContentProps={{
          type: DialogType.normal,
          title: "Potvrzení",
        }}
        hidden={false}
        modalProps={{ isOpen: true, isBlocking: true }}
        onDismiss={this.props.onDismissed}
      >

        <div>
          {this.props.question}
        </div>

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