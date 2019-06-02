import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import typeAhead from './modules/typeAhead';
import makeMap from "./modules/map";

//use the autocomplete for the form. Pass the values user enters in the form- id field
import autocomplete from './modules/autocomplete';
autocomplete($('#address'), $('#lat'), $('#lng'));

//search functionality
typeAhead( $('.search'));

//map 
makeMap($('#map'));
