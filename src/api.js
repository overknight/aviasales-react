let ticketCounter = 1;

const updateSearchID = () =>
  fetch('https://aviasales-test-api.kata.academy/search')
    .then((result) => result.json())
    .then((result) => {
      localStorage.setItem('searchID', result.searchId);
      return result.searchId;
    });

const getSearchID = () =>
  new Promise((resolve) => {
    let searchID = localStorage.getItem('searchID');
    if (!searchID) {
      updateSearchID().then((searchID) => {
        resolve(searchID);
      });
      return;
    }
    resolve(searchID);
  });

export const loadNextPage = (callback) => {
  getSearchID()
    .then((searchID) => fetch(`https://aviasales-test-api.kata.academy/tickets?searchId=${searchID}`))
    .then((response) => {
      if (response.status == 500) {
        loadNextPage(callback);
        return;
      } else if (!response.ok) return { tickets: [], finished: true };
      return response.json();
    })
    .then((data) => {
      if (!data) return;
      const tickets = data.tickets.map((ticket) => ({ ...ticket, id: ticketCounter++ }));
      callback({ tickets, finished: data.stop });
      if (!data.stop) loadNextPage(callback);
    });
};

export const getTickets = (callback) => {
  getSearchID()
    .then((searchID) => fetch(`https://aviasales-test-api.kata.academy/tickets?searchId=${searchID}`))
    .then((result) => {
      if (!result.ok) {
        const err = new Error('Ошибка при получении результатов поиска');
        err.code = result.status;
        throw err;
      }
      return result.json();
    })
    .then(
      (result) => {
        if (result.stop) {
          updateSearchID().then(() => getTickets(callback));
          return;
        }
        const tickets = result.tickets.map((ticket) => ({ ...ticket, id: ticketCounter++ }));
        callback({ tickets, shouldLoadNextPage: !result.stop });
      },
      (error) => {
        if (error.code == 404) {
          updateSearchID().then(() => getTickets(callback));
        } else if (error.code == 500) {
          callback({ error });
          return;
        }
      }
    );
};
