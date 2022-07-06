<script lang="ts">
export let meanings = {
    partsOfSpeech: [
        {
        partOfSpeech:"noun", 
        senses:[
            {
            definition:"a thing", 
            synonyms: [
                    {
                    mainWord:"a stuff",
                    relatedWords:[
                        "another stuff", 
                        "a third stuff"
                        ]
                    }
                ]
            }
        ]
        }
    ],
    numberOfSenses: 2
 } as IThesaurusEntry; 



</script>

<template lang="pug">
+each('meanings?.partsOfSpeech || [] as part')
    .partOfSpeech '{part.partOfSpeech}'
    +each('part?.senses|| [] as sense')
        p.def '{sense.definition}'
        +each('sense?.synonyms || [] as synonym')
            .syn.main '{synonym.mainWord}'
            +each('synonym?.relatedWords || [] as related')
                .syn.related {'related'}
    
</template>

<style lang="scss" global>
.partOfSpeech {
    width: 100%;
    height: 50px;
    font-size: 16px;

    p.def {
    font-style: bold;
    font-size: 12px;
    }

    .syn {

        padding: 5px;
        border-radius: 3px;
        
        .main{
        background-color: grey;
        border: 1px solid black;
        }

        .related {
        background-color: blue;
        border: 1px solid green; 
        padding: 2px;
        }
    }


}
</style>