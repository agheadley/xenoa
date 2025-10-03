<script lang="ts">
import { page } from '$app/state';

</script>


<svelte:head>
	<title>Error</title>
	<meta name="description" content="Implantify" />
</svelte:head>


<h3>Page Error</h3>

<div class="card">
  <p>{page.status} {page?.error?.message}</p>
</div>
<p>&nbsp;</p>
<p><a href="/" class="button primary">Portal Home</a></p>

<style>

</style>




