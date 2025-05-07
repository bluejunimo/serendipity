/* 
   Filename: logic.js
   Purpose: This file contains functions of the overlying logic of linking the backend of the music portion of the content to the frontend of the webpage. It is used to query the backend for OOCSI and API song details and to display the song details on the frontend of the webpage.
   Author: Max Nielsen
   Date Created: March 22, 2024
   Last Edited: April 4, 2024
*/

/**
 * The main function that checks OOCSI for music playing, queries the music services for song details, and replaces placeholders on the website with song info or notifying the user that no music is playing.
 */
async function updateMusicInfo(music_id) {

  // If no music is playing, replace placeholders with offline messages
  if (music_id == -1) {
    replacePlaceholdersWithOffline();  // TODO
    return;
  }

  // Get the song name and artist from songs.csv
  const songInfo = await getSongInfo(music_id);
  if (!songInfo || songInfo.songName == null) {
    replacePlaceholdersWithError();  // TODO
    return;
  }

  // Get the song details from the music services
  const data = await queryMusicServices(songInfo.songName, songInfo.artist);
  console.log(data);
  if (data.songName == null) {
    replacePlaceholdersWithError();
    return;
  }

  // Replace the placeholders with the song info
  replacePlaceholders(data);
}


/**
 * Replaces placeholders on the website with actual song information that was successfully retrieved from music services (Spotify, Tidal, Deezer) in logic().
 */
async function replacePlaceholders(data) {

  $('document').ready(function() {
    $('.album_art').replaceWith(`<img class="album_art" width="320px" height="320px" src="${data.albumArt}">`);
    $('.song_info h3').text(data.songName);
    $('.song_info h5').text(data.artist);

    if (data.spotifyLink == null) {
      $('.song_links a.spotify_link').addClass("offline");
    }
    else {
      $('.song_links a.spotify_link').removeClass("offline");
    }
    if (data.tidalLink == null) {
      $('.song_links a.tidal_link').addClass("offline");
    }
    else {
      $('.song_links a.tidal_link').removeClass("offline");
    }
    if (data.deezerLink == null) {
      $('.song_links a.deezer_link').addClass("offline");
    }
    else {
      $('.song_links a.deezer_link').removeClass("offline");
    }

    $('.song_links a.spotify_link').attr('href', data.spotifyLink);
    $('.song_links a.tidal_link').attr('href', data.tidalLink);
    $('.song_links a.deezer_link').attr('href', data.deezerLink);

    let column_1_text = (data.songName + " by " + data.artist + " / ").repeat(20);

    $('.column_1.real_object h3').text(column_1_text);
  });
}

async function replacePlaceholdersWithOffline() {

  $('document').ready(function() {
    $('.current_vibe').text("No vibe selected");
    $('.album_art').replaceWith(`<img class="album_art" width="320px" height="320px" src="/img/placeholder_gray.svg">`);
    $('.song_info h3').text("No music is playing");
    $('.song_info h5').text("Offline");

    $('.song_links').addClass("hidden");

    let column_1_text = ("Offline / ").repeat(40);

    $('.column_1.real_object h3').text(column_1_text);
  });

}

async function replacePlaceholdersWithError() {

  $('document').ready(function() {
    $('.album_art').replaceWith(`<img class="album_art" width="320px" height="320px" src="img/error_albumart.svg">`);
    $('.song_info h3').text("Cannot find song that is playing");
    $('.song_info h5').text("Error");

    $('.song_links').addClass("hidden");

    let column_1_text = ("Error / ").repeat(40);

    $('.column_1.real_object h3').text(column_1_text);
  });

}