<script>
    export let height = 'h-1'; // Default height, can be overridden
    export let width = 'w-full'; // Default width, can be overridden
  </script>
  
  <div class={`${width} ${height} bg-gray-200 rounded-full overflow-hidden`}>
    <div class="h-full z-50 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-infinite-progress"></div>
  </div>
  
  <style>
    @keyframes infiniteProgress {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
  
    :global(.animate-infinite-progress) {
      animation: infiniteProgress 1.5s linear infinite;
    }
  </style>