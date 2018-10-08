import React, { Component } from 'react';
import PropTypes from "prop-types";
import { Panel, PanelType } from "office-ui-fabric-react/lib/Panel";
import { DialogFooter } from "office-ui-fabric-react/lib/Dialog";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";

export class HelpPanel extends Component {
  render() {
    return (
      <Panel
        type={PanelType.large}
        title="Jak vytvořit šablonu dokumentu"
        isOpen={true}
        isLightDismiss={true}
        onDismiss={this.props.onDismissed}>
        <ol className="helpList">
          <li>
            Na záložce <strong>Vložit</strong> najděte <strong>Rychlé části</strong> a pod tím <strong>Pole</strong>. (Insert > Quick Parts > Field)
            <img src="/images/01-field-add.png" alt="Insert field" width="100%" />
          </li>
          <li>
            Otevře se dialogovné okno, kde je potřeba najít <strong>MergeField</strong> a do pole <strong>Název pole</strong> napsat libovolné pojmenování pole. (MergeField > Field name)
            <img src="/images/02-field-dialog.png" alt="Inser field dialog" width="100%" />
          </li>
          <li>
            Pole se zobrazí v dokumentu, kde byl umístěn kurzor.
            <img src="/images/03-field-added.png" alt="Result with field" width="100%" />
          </li>
          <li>Dokument uložte jako <strong>Word Document (*.docx)</strong> a nahrajte do systému</li>
        </ol>

        <DialogFooter>
          <DefaultButton text="Zavřít" onClick={this.props.onDismissed} />
        </DialogFooter>
      </Panel>
    );
  }
}

HelpPanel.propTypes = {
  onDismissed: PropTypes.func.isRequired
}