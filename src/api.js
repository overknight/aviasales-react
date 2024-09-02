let ticketCounter = 1;

export const updateSearchID = () =>
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

export const fetchTickets = (callback) => {
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
      (data) => {
        const tickets = data.tickets.map((ticket) => ({ ...ticket, id: ticketCounter++ }));
        callback({ tickets, finished: data.stop });
      },
      (error) => {
        if (error.code == 404) {
          updateSearchID().then(() => fetchTickets(callback));
        } else if (error.code == 500) {
          callback({ error });
          return;
        }
      }
    );
};
