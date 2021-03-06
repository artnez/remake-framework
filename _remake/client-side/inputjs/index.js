import initInboundDataSyncEventListener from './inboundDataSyncEventListener';
import { initSaveEventListener } from './saveEventListener';
import { initRemoveAndHideEventListeners } from './removeAndHideEventListeners';
import initChoiceAndToggleEventListeners from './choiceAndToggleEventListeners';
import initInputElementEventListener from './inputElementEventListener';
import initClickToSaveEventListener from './clickToSaveEventListener';
import { callMultipleWatchFunctions, getValueAndDataSourceElemFromKeyName } from './watchHelpers';
import { afterSync } from "./syncData";
import optionsData from './optionsData';
import { enableSaveAttribute, initSaveFunctions, callSaveFunction } from './onSave';
import initEditableAttribute from './editableAttribute';
import initAddingItemEventListener from './addingItemEventListener';
import initSortableElements from './sortableElements';
const merge = require('lodash/merge');

function initInputEventListeners (options) {
  merge(optionsData, options);
  
  enableSaveAttribute(afterSync);
  initInboundDataSyncEventListener();
  initSaveEventListener();
  initRemoveAndHideEventListeners();
  initChoiceAndToggleEventListeners();
  initInputElementEventListener();
  initClickToSaveEventListener();
  initEditableAttribute();
  initAddingItemEventListener();

  if (optionsData.sortable) {
    initSortableElements();
  }
}

export {
  initInputEventListeners,
  initSaveFunctions,
  callSaveFunction,
  callMultipleWatchFunctions,
  getValueAndDataSourceElemFromKeyName
}





