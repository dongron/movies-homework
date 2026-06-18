export type MovieSearchResult = {
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
};

export type MovieRating = {
    Source: string;
    Value: string;
};

export type MovieSearchResponse = {
    Search: MovieSearchResult[];
    totalResults: string;
    Response: string;
};

export type MovieDetails = {
    Title: string;
    Year: string;
    Rated: string;
    Released: string;
    Runtime: string;
    Genre: string;
    Director: string;
    Writer: string;
    Actors: string;
    Plot: string;
    Language: string;
    Country: string;
    Awards: string;
    Poster: string;
    Ratings: MovieRating[];
    Metascore: string;
    imdbRating: string;
    imdbVotes: string;
    imdbID: string;
    Type: string;
    DVD: string;
    BoxOffice: string;
    Production: string;
    Website: string;
    Response: string;
};
