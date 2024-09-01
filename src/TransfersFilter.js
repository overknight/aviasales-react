import { useState, useEffect } from 'react';

import { store, actions as storeActions, bindHook, unbindHook } from './reducer';
import stylesheet from './css/transfers-filter.module.scss';

const maxStops = 3;

let filterOptions = {
  all: ({ target: { checked } }) => {
    const filter = new Set();
    if (checked) for (let i = 0; i <= maxStops; i++) filter.add(i);
    storeActions.applyTransfersFilter(filter);
  },
};

for (let idx = 0; idx <= maxStops; idx++) {
  filterOptions[idx] = () => {
    const filter = new Set(store.getState().transfersFilter);
    if (filter.has(idx)) filter.delete(idx);
    else filter.add(idx);
    storeActions.applyTransfersFilter(filter);
  };
}

const useStore = () => {
  const [filter, setFilter] = useState(store.getState().transfersFilter);
  const [isFetching, setFetchingStatus] = useState(store.getState().isFetching);
  useEffect(() => {
    const handler = () => {
      const { transfersFilter, isFetching } = store.getState();
      setFilter(transfersFilter);
      setFetchingStatus(isFetching);
    };
    bindHook(handler);
    return () => unbindHook(handler);
  });
  return { filter, isFetching };
};

const TransfersFilter = () => {
  const { filter, isFetching } = useStore();
  return (
    <aside>
      <div className={stylesheet['transfers-filter']}>
        <h2>Количество пересадок</h2>
        <label>
          <input type="checkbox" checked={filter.size == maxStops + 1} onChange={filterOptions.all} />
          <div>Все</div>
        </label>
        <label>
          <input type="checkbox" checked={filter.has(0)} onChange={filterOptions['0']} />
          <div>Без пересадок</div>
        </label>
        <label>
          <input type="checkbox" checked={filter.has(1)} onChange={filterOptions['1']} />
          <div>1 пересадка</div>
        </label>
        <label>
          <input type="checkbox" checked={filter.has(2)} onChange={filterOptions['2']} />
          <div>2 пересадки</div>
        </label>
        <label>
          <input type="checkbox" checked={filter.has(3)} onChange={filterOptions['3']} />
          <div>3 пересадки</div>
        </label>
      </div>
      {isFetching ? (
        <div className={stylesheet['preload-notification']}>
          <div className={stylesheet['loading-spinner']}></div>
          <span>Информация о билетах обновляется</span>
        </div>
      ) : null}
    </aside>
  );
};

export default TransfersFilter;
