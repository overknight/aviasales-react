import { useState, useEffect } from 'react';

import { store, actions as storeActions, bindHook, unbindHook } from './reducer';
import stylesheet from './css/price-filter.module.scss';

const onSortOptionSelected = ({ target: { value } }) => {
  storeActions.setSortOrder(value);
};

const PriceFilter = () => {
  const [selectedOption, setSortOrder] = useState(store.getState().sortOrder);
  useEffect(() => {
    const handler = () => {
      setSortOrder(store.getState().sortOrder);
    };
    bindHook(handler);
    return () => unbindHook(handler);
  });
  return (
    <fieldset className={stylesheet['price-filter']}>
      <label>
        <input
          type="radio"
          name="opt-sort-price"
          value="cheapest"
          onChange={onSortOptionSelected}
          checked={selectedOption == 'cheapest'}
        />
        <div>
          <span>Самый дешевый</span>
        </div>
      </label>
      <label>
        <input
          type="radio"
          name="opt-sort-price"
          value="fastest"
          onChange={onSortOptionSelected}
          checked={selectedOption == 'fastest'}
        />
        <div>
          <span>Самый быстрый</span>
        </div>
      </label>
      <label>
        <input
          type="radio"
          name="opt-sort-price"
          value="optimal"
          onChange={onSortOptionSelected}
          checked={selectedOption == 'optimal'}
        />
        <div>
          <span>Оптимальный</span>
        </div>
      </label>
    </fieldset>
  );
};

export default PriceFilter;
