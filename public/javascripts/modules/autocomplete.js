//CLIENT SIDE JS
function autocomplete(input, latInput, lngInput){
    if(!input) return; //skip this fn from running if no input on page
    const dropdown = new google.maps.places.Autocomplete(input);

    dropdown.addListener('place_changed', () => {
        const place = dropdown.getPlace();
        latInput.value = place.geometry.location.lat();
        lngInput.value = place.geometry.location.lng();
    });
    //if someone hits Enter on the adress field, dont submit the form
    input.on('keydown', (e) => {
        //Enter key code is 13
        if (e.keyCode === 13) e.preventDefault();
    })
}

export default autocomplete;