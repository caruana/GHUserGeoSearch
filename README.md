# GHUserGeoSearch
Search GitHub users by location and then get user info.

GitHub provides a search user API but limits the accessible data set to 1000 results. GHUserGeoSearch will iterate through a two character array of values (a-z0-9 & ._-) in order to access the full dataset of a geo search.

After retrieving the dataset, GHUserGeoSearch calls the GitHub API to request the publically exposed user object properties.
