import React from 'react';
import ReactDOM from 'react-dom/client';

import { actions as storeActions } from './reducer';
import { getTickets, loadNextPage } from './api';
import PriceFilter from './PriceFilter';
import Tickets from './Tickets';
import TransfersFilter from './TransfersFilter';
import LoadingSpinner from './LoadingSpinner';

const root = ReactDOM.createRoot(document.getElementById('root'));

const paginator = (() => {
  let setTicketsLimit,
    visible = true;
  return Object.freeze(
    Object.defineProperties(
      {
        bindHook: (setStateHook) => (setTicketsLimit = setStateHook),
        showMore: () =>
          setTicketsLimit((n) => {
            visible = false;
            return n + 5;
          }),
        domRef: React.createRef(),
      },
      {
        visible: {
          get() {
            return visible;
          },
          set(v) {
            visible = v;
          },
        },
      }
    )
  );
})();

const showError = ({ message }) => {
  root.render(
    <div className="msg-warning">
      <div className="icon"></div>
      <span>{message}</span>
      <button
        type="button"
        onClick={() => {
          root.render(<LoadingSpinner />);
          getTickets(responseHandler);
        }}
      >
        Повторить попытку
      </button>
    </div>
  );
};

const responseHandler = (responseData) => {
  if (!responseData.error) storeActions.updateTickets(responseData.tickets);
  else {
    storeActions.catchError(responseData.error);
    showError(responseData.error);
    return;
  }
  if (responseData.shouldLoadNextPage)
    loadNextPage((responseData) => {
      storeActions.appendTickets(responseData.tickets);
      if (responseData.finished) storeActions.fetchingFinished();
    });
  root.render(
    <>
      <TransfersFilter />
      <div className="ticket-list">
        <PriceFilter />
        <Tickets {...{ paginator }} />
        <button ref={paginator.domRef} type="button" onClick={paginator.showMore} className="btn-paginator">
          Показать еще 5 билетов!
        </button>
      </div>
    </>
  );
};

getTickets(responseHandler);

root.render(<LoadingSpinner />);
