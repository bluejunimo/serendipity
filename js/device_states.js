/**
 * This function updates the state of a device based on the given state value.
 * device_id - The ID of the device.
 * state - current_state.
 */
async function updateDeviceState(device_id, state) {
  console.log("Device: " + device_id + " |  State: " + state);

  $('document').ready(function() {
    
    if(state == 0) {
      $('.device_' + device_id + ' img').attr('src', 'img/devices/online_' + device_id + '.svg');
    }
    if(state == 1) {
      $('.device_' + device_id + ' img').attr('src', 'img/devices/waiting_' + device_id + '.svg');
    }
    if(state == 2) {
      $('.device_' + device_id + ' img').attr('src', 'img/devices/submitted_' + device_id + '.svg');
    }
    if(state == 3) {
      $('.device_' + device_id + ' img').attr('src', 'img/devices/online_' + device_id + '.svg');
    }

  });
}