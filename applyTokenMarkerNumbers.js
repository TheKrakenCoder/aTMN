on("ready", function () {
   // Check if the namespaced property exists, creating it if it doesn't
   if (!state.aTMNJMU) {
     state.aTMNJMU = {
       version: 1.0,
       config: {
         markerNames: "pink,purple",
       },
       count: 0,
     };
   }
   state.aTMNJMU.count++;
   
   on("chat:message", function (msg) {
       if (msg.type == "api" && msg.content.indexOf("!aTMN") == 0) {
         // process command line parameters
         var params = msg.content.split(/\s+/);
         // one command line argument means we are setting the markers
         if (params.length > 1) {
            let markerNames = params[1].trim();
            markerNames = markerNames.replace(/['"]+/g, '');
            state.aTMNJMU.config.markerNames = markerNames;
            sendChat("aTMN", "/w gm setting marker names to " + markerNames);
            return;
         }

         // let colors = ['pink', 'purple'];
         let colors = state.aTMNJMU.config.markerNames.split(",");
         var selected = msg.selected;
         if (!selected) {
            sendChat("aTMN", "/w gm No tokens were selected");
            return;
         }

         var removingMarkers = false;
         if (msg.content.indexOf("!aTMNX") == 0) removingMarkers = true;

         let maxTokens = 10*colors.length;
         let icnt = 0;
         for (let i = 0; i < selected.length; i++) {
            if ( (!removingMarkers) && (icnt >= maxTokens)) {
              sendChat("aTMN", "/w gm A max of " + maxTokens + " tokens can be modified at once");
              return;
            }
            let obj = selected[i];
            if (!obj) {
              sendChat("aTMN", "/w gm Undefined object in the selected list");
              continue;
            }
            var token = getObj('graphic', obj._id);
            if (!token) {
              sendChat("aTMN", "/w gm Can't get object from object id");
              continue;
            }
            // don't change tokens controlled by players
            let controlledby = (getObj('character', token.get('represents')) || token).get('controlledby');
            if (controlledby) continue;

            if (token.get("_type") === "graphic" && token.get("_subtype") === "token") {
               if (removingMarkers) {
                  // since we can't guarantee we are removing form the exact sme set of selected
                  // tokens as when we added he markers, we just set pink and purple to false
                  for (let c = 0; c < colors.length; c++) {
                    token.set(`status_${colors[c]}`, false);
                    // token.set(`status_${colors[1]}`, false);
                  }
               } else {
                  let color = colors[Math.floor(icnt/10)];
                  let number = icnt%10;
                  let colNum = color + ':' + number;
                  token.set(`status_${color}`, number);
               }
            }  // if graphic token
            icnt++;
          };  // for each selected token
       }  // if command started with !aTMN
   });  // on chat message
});  // on ready

