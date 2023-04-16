import { useEffect, useMemo, useRef, useState } from "react";

import "./App.css";
import { UsersList } from "./components/UsersList";
import { SortBy, User } from "./types.d";

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [showColors, setShowColors] = useState(false);
  const [sorting, setSorting] = useState<SortBy>(SortBy.NONE);
  const originalUsers = useRef<User[]>([]);
  //UseRef guarda un valor que queremos q se comparta entre renderizados pero q al cambiar no vuelva a renderizar el componente
  const [filterCountry, setFilterCountry] = useState<string | null>(null);

  const toggleColors = () => {
    setShowColors(!showColors);
  };

  const handleReset = () => {
    setUsers(originalUsers.current);
  };

  const handleDelete = (email: string) => {
    const filteredUsers = users.filter((user) => user.email !== email);
    setUsers(filteredUsers);
  };

  const handleChangeSort = (sort: SortBy) => {
    setSorting(sort);
  };

  useEffect(() => {
    fetch("https://randomuser.me/api/?results=100")
      .then((response) => response.json())
      .then((response) => {
        setUsers(response.results);
        originalUsers.current = response.results;
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const toggleSortByCountry = () => {
    const newSortingValue =
      sorting === SortBy.NONE ? SortBy.COUNTRY : SortBy.NONE;
    setSorting(newSortingValue);
  };

  const filteredUsers = useMemo(() => {
    return typeof filterCountry === "string" && filterCountry.length > 0
      ? users.filter((user) => {
          return user.location.country
            .toLowerCase()
            .includes(filterCountry.toLowerCase());
        })
      : users;
  }, [users, filterCountry]);

  // const sortUsers = (users: User[]) => {
  //   return sortByCountry
  //     ? //[...users]... hace una copia el array para después ordenarlo pq sort muta el array
  //       [...users].sort((a, b) => {
  //         //Nuevo méodo para comparar sin mutar el array
  //         //users.toSorted((a,b)) => RECOMENDADO
  //         //localeCompare compara string,tiene en cuenta acentos
  //         //De esta forma los ordena ascendentemente
  //         return a.location.country.localeCompare(b.location.country);
  //       })
  //     : users;
  // };

  // ORDENAR SOLO POR COUNTRY:
  // const sortedUsers = useMemo(() => {
  //   return sorting === SortBy.COUNTRY
  //     ? //[...users]... hace una copia el array para después ordenarlo pq sort muta el array
  //       [...filteredUsers].sort((a, b) => {
  //         //Nuevo méodo para comparar sin mutar el array
  //         //users.toSorted((a,b)) => RECOMENDADO
  //         //localeCompare compara string,tiene en cuenta acentos
  //         //De esta forma los ordena ascendentemente
  //         return a.location.country.localeCompare(b.location.country);
  //       })
  //     : filteredUsers;
  // }, [filteredUsers, sorting]);

  // ORDENAR POR CUALQUIER PARÁMETRO ESPECIFICADO
  const sortedUsers = useMemo(() => {
    if (sorting === SortBy.NONE) return filteredUsers;

    const compareProperties: Record<string, (user: User) => any> = {
      [SortBy.COUNTRY]: (user) => user.location.country,
      [SortBy.NAME]: (user) => user.name.first,
      [SortBy.LAST]: (user) => user.name.last,
    };

    return [...filteredUsers].sort((a, b) => {
      const extractProperty = compareProperties[sorting];
      return extractProperty(a).localeCompare(extractProperty(b));
    });
  }, [filteredUsers, sorting]);

  return (
    <div className="App">
      <h1>Userlist Test</h1>
      <header>
        <button onClick={toggleColors}>Draw files</button>
        <button onClick={toggleSortByCountry}>
          {sorting === SortBy.COUNTRY ? "No order" : "Order by country"}
        </button>
        <button onClick={handleReset}>Reset table</button>
        <input
          type="text"
          placeholder="Filter by country"
          onChange={(e) => setFilterCountry(e.target.value)}
        />
      </header>
      <main>
        <UsersList
          showColors={showColors}
          users={sortedUsers}
          deleteUser={handleDelete}
          handleChangeSort={handleChangeSort}
        />
      </main>
    </div>
  );
}

export default App;
