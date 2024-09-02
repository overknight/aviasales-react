import { createStore, applyMiddleware, bindActionCreators } from 'redux';
import { thunk } from 'redux-thunk';

import { fetchTickets, updateSearchID } from './api';

const registeredHooks = new Set();

const actionsMap = new Map([
  [
    'TICKETS_UPDATE',
    (state, action) => {
      const tickets = [...state.tickets, ...action.payload];
      delete state.error;
      return Object.assign({}, state, { tickets });
    },
  ],
  [
    'FILTER_TRANSFERS_APPLY',
    (state, action) => {
      return Object.assign({}, state, { transfersFilter: action.payload });
    },
  ],
  [
    'SORT_ORDER_SET',
    (state, action) => {
      const { sortOrder } = action;
      return Object.assign({}, state, { sortOrder });
    },
  ],
  [
    'FETCH_TICKETS_FINISHED',
    (state) => {
      const isFetching = false;
      return Object.assign({}, state, { isFetching });
    },
  ],
  [
    'ERROR_CATCH',
    (state, action) => {
      return Object.assign({}, state, { error: action.info });
    },
  ],
]);

const reducer = (
  state = { tickets: [], isFetching: true, transfersFilter: new Set([0, 1, 2]), sortOrder: 'cheapest' },
  action
) => {
  if (actionsMap.has(action.type)) return actionsMap.get(action.type)(state, action);
  return state;
};

export const store = createStore(reducer, applyMiddleware(thunk));

export const actions = bindActionCreators(
  {
    recieveTickets: () => (dispatch, getState) => {
      fetchTickets((responseData) => {
        const { tickets } = getState();
        if (!responseData.error) dispatch({ type: 'TICKETS_UPDATE', payload: responseData.tickets });
        else if (!tickets.length) {
          dispatch({ type: 'ERROR_CATCH', info: responseData.error });
          return;
        }
        if (responseData.finished && !tickets.length) updateSearchID().then(() => actions.recieveTickets());
        else if (!responseData.finished) actions.recieveTickets();
        else dispatch({ type: 'FETCH_TICKETS_FINISHED' });
      });
    },
    applyTransfersFilter: (payload) => ({ type: 'FILTER_TRANSFERS_APPLY', payload }),
    setSortOrder: (sortOrder) => ({ type: 'SORT_ORDER_SET', sortOrder }),
  },
  store.dispatch
);

store.subscribe(() => {
  for (const hook of registeredHooks) hook();
});

export const bindHook = (handler) => {
  registeredHooks.add(handler);
};

export const unbindHook = (handler) => {
  registeredHooks.delete(handler);
};
