const fetchMovies = async (params, page = 1) => {
  var url = `https://www.omdbapi.com/?apikey=88aad9a4&s=${params.title}`
  if (params.type) {
    url += `&type=${params.type}`
  }
  if (params.year) {
    url += `&y=${params.year}`
  }
  url += `&page=${page}`
  try {
    const response = await fetch(url, {
      method: 'GET',
    })
    const results = await response.json()
    if (results.Response === "False") {
      return {error: results.Error}
    }
    var res = {}
    for (var key in results.Search) {
      const title = results.Search[key].Title
      delete results.Search[key].Title
      res[title]=results.Search[key]
    }
    return {results: res, number: results.totalResults}
  }
  catch (error) {
    console.log(error)
    return 0;
  }
}

export default fetchMovies