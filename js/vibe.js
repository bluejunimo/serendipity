`use-strict`

/* 
   Filename: vibe.js
   Purpose: This file contains functions of finding the vibe from the music_id and updating the visuals of the website according to the new vibe. 
   Author: Max Nielsen
   Date Created: March 22, 2024
   Last Edited: April 4, 2024
*/

  /*
    This function is responsible for updating the vibe of the website based on the music_id provided. It calculates the vibe_id, retrieves vibe information, and updates the visuals of the website accordingly.
  */
async function updateVibe(music_id) {
  console.log("updating vibe...");
  const num_songs_per_vibe = 20;

  var vibe_id = Math.floor(music_id / num_songs_per_vibe);
  var vibe_info = await getVibeInfo(vibe_id);

  if (!vibe_info || vibe_info.vibeName == null) {
    console.log("FAILED TO FIND VIBE");
    return;
  }

  $('document').ready(function() {
    $('.current_vibe').text(vibe_info.vibeName);
    $('.text_wrapper').css("background-color", vibe_info.secondaryColour);
    $('.device_wrapper').css("background-color", vibe_info.primaryColour);
    $('.music_player').css("background-color", vibe_info.primaryColour);
    $('.column_1').css("background-color", vibe_info.primaryColour);
    $('html').css("background", "linear-gradient(" + vibe_info.primaryColour + ", var(--color-white))");
    console.log("updated vibe");
  });

 
}


  /*
    This function retrieves the vibe information based on the vibe_id provided. It queries the vibes.csv file to get the vibe name, primary color, and secondary color associated with the vibe_id.
    This function returns an object containing the vibe information if successful, or null if the vibe_id is out of range or data is unavailable.
  */
async function getVibeInfo(vibe_id) {
  return new Promise((resolve, reject) => {
    vibe_id++;
    $.get("db/vibes.csv", function(data) {
      var rows = data.split("\n");

      if (vibe_id >= 0 && vibe_id < rows.length) {
        var vibeData = rows[vibe_id].split(",");
        console.log(vibeData);
        resolve({
          vibeName: vibeData[1],
          primaryColour: vibeData[2],
          secondaryColour: vibeData[3]
        });
      } else {
        console.log("FAILED TO GET VIBE DETAILS");
        resolve(null); // Resolve with null to indicate no data was found
      }
    });
  });
}