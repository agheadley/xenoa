/* 
N.B. need to use objects, not simple number, boolean, string for $state to by used in different files
https://www.reddit.com/r/sveltejs/comments/1fud3wg/state_reactivity_returned_by_class_method_not/?scrlybrkr=dc0fd66d
https://svelte.dev/playground/untitled?version=5.5.3#H4sIAAAAAAAACoVUwW6bQBD9ldGqkkFCuGfASFFPPURVpUo9hBwIO9ib4lm6OySNEP9eLQs2JFg52BIzb97svvegF7Vq0IrkoRdUnlEk4q5tRST4rXUP9gUbRhEJqztTuUpmK6NazgsqWJ1bbRh6OKO15RF_dtghDFAbfYZdvGe0HHuK-Nnu3Ij71R1VrDTBqSTZYBD2Y4eXLHEpZRC6-lBQtr8upeypY9YEmqpGVX8OvWcZciilnE8C2d7D8oKyNmfNZQOK5raFBunIpwT61dIj8v2E-E5jKQhjDx2yffuO7K8DbFD8LhUrOv6YGW6NQqU7YjSfUnzzuIlJROKspaoVSpGw6XCILuYtFL-a-GyXBlZNaS3cLx0b9Z-l8aUDfLFcMgYPj2Hq2q-rE7m-RKNeUMZPb0EQwiEHPikbr2gm7bYYpjtdF311blPBGwLCFBCD3Bnye9Zs6ZSUjfGLeJ-zTNALmaf7kIgtotW1F_NjjKH3wS-40mR5TuEvfSclHGa6gllxgwkUo43MUIhobkn0r4DS5ACLR6i1ATcAhfDoIZ2mxv8NV9rOnoLlIcJ0gb3l00170-vddINxo4_BrqxBkUXDu2hL6c3itCqc9R8lxH_jN2Yl3BxBwtdVkIMw_fhyPA7_Aa1CZTLlBAAA
*/

export const alert = $state({msg:"",type:'',ms:3000});


export const delay = async(ms:number) => new Promise(res => setTimeout(res, ms));

