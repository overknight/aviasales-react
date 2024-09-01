import { createStore, bindActionCreators } from 'redux';

const registeredHooks = new Set();

const actionsMap = new Map([
  [
    'TICKETS_UPDATE',
    (state, action) => {
      return Object.assign({}, state, { tickets: action.payload });
    },
  ],
  [
    'TICKETS_APPEND',
    (state, action) => {
      const tickets = [...state.tickets, ...action.payload];
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

const reducer = (state = { isFetching: true, transfersFilter: new Set([0, 1, 2]), sortOrder: 'cheapest' }, action) => {
  if (actionsMap.has(action.type)) return actionsMap.get(action.type)(state, action);
  return state;
};

export const store = createStore(reducer);

export const actions = bindActionCreators(
  {
    updateTickets: (payload) => ({ type: 'TICKETS_UPDATE', payload }),
    appendTickets: (payload) => ({ type: 'TICKETS_APPEND', payload }),
    fetchingFinished: () => ({ type: 'FETCH_TICKETS_FINISHED' }),
    catchError: (info) => ({ type: 'ERROR_CATCH', info }),
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
