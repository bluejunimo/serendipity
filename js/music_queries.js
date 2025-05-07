/* 
   Filename: music_queries.js
   Purpose: This file contains functions to query multiple music service APIs (Spotify, Tidal, Deezer) to retrieve song information and to display it.
   Author: Max Nielsen
   Date Created: March 22, 2024 
   Date Last Edited: March 27, 2024
*/


// A simple function to test the functionality of the music APIs without OOCSI
async function basicAPITest(songName, artist) {
  const data = await queryMusicServices(songName, artist)
  replacePlaceholders(data);
}

/**
 * Accesses our database of songs and grabs the data of musicID.
 * @param {int} musicID - The row the song is at in songs.csv and the file number of the song in the microSD card on the YX5300 MP3 Module.
 * returns {Object} - The song name and the artist name in the form of an Object.
 * @throws {Error} - If the musicID is not a positive integer or is not in the songs.csv file.
 */
async function getSongInfo(musicID) {
  return new Promise((resolve, reject) => {
    $.get("db/songs.csv", function(data) {
      var rows = data.split("\n");

      if(musicID >= 0 && musicID < rows.length) {
        var songData = rows[musicID].split(",");
        console.log(songData);
        resolve({
          songName: songData[1],
          artist: songData[2]
        });
      } else {
        console.log("FAILED TO FIND SONG");
        resolve(null); // Resolve with null to indicate no data was found
      }
    });
  });
}


/**
 *  Queries multiple music services (Spotify, Tidal, Deezer) to retrieve song information.
 *  @param {string} songName - The name of the song to query.
 *  @param {string} artistName - The name of the artist of the song.
 *  @returns {Object} - An object containing data from Spotify, Tidal, and Deezer, including song name, artist, album art, and links to the respective platforms.
 *  @throws {Error} - If any of the queries fail or authentication to Spotify/Tidal fails.
*/
async function queryMusicServices(songName, artistName) {
  // Spotify query
  const SpotifyAccessCode = await loginSpotify();
  const spotifyData = await querySpotify(songName, artistName, SpotifyAccessCode);

  // Tidal query
  const TidalAccessCode = await loginTidal();  
  const tidalData = await queryTidal(songName, artistName, TidalAccessCode);

  // Deezer Music query
  const deezerData = await queryDeezerMusic(songName, artistName);

  console.log(tidalData);
  console.log(spotifyData);

  // Return all the data necessary for the frontend
  return {
    songName: tidalData.songName ?? spotifyData.songName,
    artist: tidalData.artist ?? spotifyData.artist,
    albumArt: tidalData.albumArt ?? spotifyData.albumArt,
    spotifyLink: spotifyData.link,
    tidalLink: tidalData.link,
    deezerLink: deezerData.link
  };
}


/**
 * Logs into Spotify's Web API to obtain an access token for authentication (OAuth2).
 * https://developer.spotify.com/documentation/web-api/tutorials/getting-started#request-an-access-token
 * 
 * @returns {Promise<string|null>} - A promise that resolves with an access token if successful, or null if an error occurs.
*/
function loginSpotify() {

  // Create the login request
  const settings = {
    url: `https://accounts.spotify.com/api/token`,
    type: `POST`,
    contentType: `application/x-www-form-urlencoded`,
    data: {
      grant_type: `client_credentials`,
      client_id: `6d7a02d861734446a40745cb792d1497`,
      client_secret: `74f68a92ae06499e880f2b0d21e99d79`
    }
  };

  // Fetch the access token from Spotify's Web API 
  return $.ajax(settings)
    .then(response => {
      return response.access_token;
    })
    .catch(error => {
      console.error('Error logging into Spotify API:', error);
      return null;
    });
}


/**
 * Queries Spotify API for song details (Requires OAuth2 token).
 * https://developer.spotify.com/documentation/web-api/reference/search
 * 
 * @param {string} songName - The name of the song to search for.
 * @param {string} artistName - The name of the artist of the song.
 * @param {string} accessToken - Access token for Spotify API.
 * @returns {Promise<Object|null>} - A promise that resolves with an object containing song details (name, artist, album art, Spotify link) if successful, or null if an error occurs.
*/
function querySpotify(songName, artistName, accessToken) {

  // Create the search query  
  const queryParams = {
    q: `track:${songName} artist:${artistName}`,
    type: 'track',
    limit: 1,
    market: 'US'
  };
  
  const settings = {
    url: `https://api.spotify.com/v1/search`,
    data: queryParams,
    crossDomain: true,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  };

  // Fetch the song details from Spoitfy's Web API
  return $.ajax(settings)
    .then(response => {
      const song = response.tracks.items[0];

      // Return the song details
      return {
        songName: song.name,
        artist: song.artists[0].name,
        albumArt: song.album.images[0].url,
        link: song.external_urls.spotify
      };
    })
    .catch(error => {
      console.error('Error querying Spotify API:', error);
      return {
        songName: null,
        artist: null,
        albumArt: null,
        link: null
      };
    });
}


/**
 * Logs into Tidal's Web API to obtain an access token for authentication (OAuth2).
 * https://developer.tidal.com/documentation/authorization/authorization-client-credentials
 * 
 * @returns {Promise<string|null>} - A promise that resolves with an access token if successful, or null if an error occurs.
*/
function loginTidal() {

  // Convert login details to Base64 using btoa(<ClientID:SecretKey>) - Required for Tidal API
  $B64CREDS = btoa("beRv5FyhDntHJl8h:iHVilGvT9ixrfvyD23ZnNBbwqNlOpPzO4IYNr50l4Uc=");

  // Create the login request
  const settings = {
    url: `https://auth.tidal.com/v1/oauth2/token`,
    type: `POST`,
    contentType: `application/x-www-form-urlencoded`,
    data: {
      grant_type: `client_credentials`
    },
    headers: {
      authorization: `Basic ` + $B64CREDS
    }
  };

  // Fetch the access token from Tidal Web API
  return $.ajax(settings)
    .then(response => {
      return response.access_token;
    })
    .catch(error => {
      console.error('Error logging into Tidal API:', error);
      return null;
    });
}


/**
 * Queries Tidal's Web API for song details (Requires OAuth2 token).
 * https://developer.tidal.com/apiref?spec=search&ref=search
 * 
 * @param {string} songName - The name of the song to search for.
 * @param {string} artistName - The name of the artist of the song.
 * @param {string} accessToken - Access token for Tidal API.
 * @returns {Promise<Object|null>} - A promise that resolves with an object containing song details (name, artist, album art, Tidal link) if successful, or null if an error occurs.
*/
function queryTidal(songName, artistName, accessToken) {

  // Create the search query  
  const queryParams = {
    query: `${songName} ${artistName}`,
    type: `TRACKS`,
    limit: 1,
    countryCode: `US`,
    popularity: `WORLDWIDE`
  };
  
  const settings = {
    url: `https://openapi.tidal.com/search`,
    contentType: `application/vnd.tidal.v1+json`,
    data: queryParams,
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: 'application/vnd.tidal.v1+json',
    }
  };

  // Fetch the song details from Tidal API
  return $.ajax(settings)
    .then(response => {
      const song = response.tracks[0].resource;

      // Return the song details
      return {
        songName: song.title,
        artist: song.artists[0].name,
        albumArt: song.album.imageCover[1].url,
        link: song.tidalUrl
      };
    })
    .catch(error => {
      console.error('Error querying Tidal API:', error);
      return {
        songName: null,
        artist: null,
        albumArt: null,
        link: null
      };
    });
}


/**
 * Queries Deezer Music API for song details.
 * https://rapidapi.com/deezerdevs/api/deezer-1
 * 
 * @param {string} songName - The name of the song to search for.
 * @param {string} artistName - The name of the artist of the song.
 * @returns {Promise<Object|null>} - A promise that resolves with an object containing song details (name, artist, album art, Deezer link) if successful, or null if an error occurs.
 * Note: Does not use OAuth2, so it does not need to login beforehand
*/
function queryDeezerMusic(songName, artistName) {

  // Create the search query
  const settings = {
    url: `https://deezerdevs-deezer.p.rapidapi.com/search?q=track:"${songName}" artist:"${artistName}"`,
    async: true,
    crossDomain: true,
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': 'b9e463a9cemsh13f7c61bbfcef42p1d4904jsn5b86890580fc',
      'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com'
    }
  };

  // Fetch the song details from Deezer API (using RapidAPI)
  return $.ajax(settings)
    .then(response => {
      const song = response.data[0];

      // Return the song details
      return {
        songName: song.title,
        artist: song.artist.name,
        albumArt: song.album.cover_xl,
        link: song.link
      };
    })
    .catch(error => {
      console.error('Error querying Deezer Music API:', error);
      return {
        songName: null,
        artist: null,
        albumArt: null,
        link: null
      };
    });
}
