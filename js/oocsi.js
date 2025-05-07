var music_id = -1;

/**
 * Function to establish connection with OOCSI server.
 * Subscribes to the dbsu10_serendipity channel and handles any incoming messages for music_id and current_state.
 */
function establishOOCSIConnection() {
  const address = 'oocsi.id.tue.nl';
  const channelName = 'dbsu10_serendipity';

  OOCSI.connect(`wss://${address}/ws`);


  OOCSI.subscribe(channelName, function(msg) {

    console.log(msg);

    // Devie ID
    if (msg.data.device_id == null) {
      console.error("No device assigned to message. Ignoring message...");
      return;
    }

    // Music ID
    if (msg.data.music_id != null && msg.data.music_id != music_id && msg.data.music_id != 0 && msg.data.device_id == 1) {
      console.log("MUSIC ID UPDATING...");
      // update song information
      music_id = msg.data.music_id;
      updateMusicInfo(music_id);
      updateVibe(music_id);
    }

    // Current State
    if (msg.data.current_state != null) {
      console.log("UPDATING DEVICE STATES...");
      updateDeviceState(msg.data.device_id, msg.data.current_state);
    }
  });

  var data = { ping_all: 1 };
  OOCSI.send("dbsu10_serendipity", data);

  setTimeout(function() {
    if (OOCSI.isConnected()) {
      // print log in success 
      console.log("CONNECTED TO OOCSI!");
    }
  }, 200);
}
