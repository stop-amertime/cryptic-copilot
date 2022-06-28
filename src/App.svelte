<script lang="ts">

import Grid from './Grid.svelte'
import Panel from './Panel.svelte'
import {Load} from './modules/FileManager.js'
import {dictionary, gridTemplate} from './stores'



// STARTUP
$dictionary = Load.lastOrDefaultDictionary() 
$gridTemplate = Load.lastOrDefaultLayout()

</script>

<div id="main">


  <div id="gridArea">
    {#await $gridTemplate}
    <div id="gridLoading"> LOADING... </div>
    {:then value} 
    <Grid gridTemplate={value}/> 
    {/await}
  </div>
  
  <div id="panelArea">
    <Panel/>
  </div>


</div>


<style>
* {
  box-sizing: border-box;
}

:global(*) {
  font-family:'Courier New', Courier, monospace;
}

@media (min-width: 700px) {
  #main {
    position: absolute 0 0;
    width: 100vw;
    height: 100vh;
    overflow-y: auto;
    display: flex;
    flex-wrap: nowrap;
    padding:20px;
    align-items:center;
  }

  #gridArea{
    flex: 1 0 300px;
    padding-right: 15px;
  }

  #panelArea{
    flex: 1 1 400px;
    height: 100%;
  }

  #gridLoading {
    font-size: 100px; 
    /* LOL */
  }
}
@media (max-width: 699px) {
  
  #main{
    width: 100vw; 
  }

  #gridArea {
    width: 100%;
    height: 40%;
  }

  #panelArea{
    width: 100%;
    height: 70%;
    margin: 20px;
    margin-top: 0px;
  }


}



</style>
