export const getData = async <T>(
    url: string,
    username: string,
    password: string
  )
  : Promise<T> => {
    const res = await fetch(url, {
      method: 'Post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    return await res.json();
  }
  