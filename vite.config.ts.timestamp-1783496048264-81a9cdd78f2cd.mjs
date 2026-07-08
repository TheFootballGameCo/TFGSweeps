// vite.config.ts
import { defineConfig } from "file:///sessions/busy-kind-edison/mnt/TFG%20Sweeps/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/busy-kind-edison/mnt/TFG%20Sweeps/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api/scoreboard": {
        target: "https://site.api.espn.com",
        changeOrigin: true,
        // /api/scoreboard?dates=... -> ESPN's eng.1 scoreboard
        rewrite: (path) => path.replace(/^\/api\/scoreboard/, "/apis/site/v2/sports/soccer/eng.1/scoreboard")
      },
      "/api/standings": {
        target: "https://site.api.espn.com",
        changeOrigin: true,
        // /api/standings?season=... -> ESPN's eng.1 standings (the real PL table)
        rewrite: (path) => path.replace(/^\/api\/standings/, "/apis/v2/sports/soccer/eng.1/standings")
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvYnVzeS1raW5kLWVkaXNvbi9tbnQvVEZHIFN3ZWVwc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL3Nlc3Npb25zL2J1c3kta2luZC1lZGlzb24vbW50L1RGRyBTd2VlcHMvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL3Nlc3Npb25zL2J1c3kta2luZC1lZGlzb24vbW50L1RGRyUyMFN3ZWVwcy92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcblxuLy8gVml0ZSBjb25maWcuXG4vLyBEdXJpbmcgbG9jYWwgZGV2ZWxvcG1lbnQsIHJlcXVlc3RzIHRvIFwiL2FwaS8qXCIgYXJlIHByb3hpZWQgdG8gRVNQTidzIHB1YmxpY1xuLy8gUHJlbWllciBMZWFndWUgZmVlZC4gVGhpcyBrZWVwcyBFU1BOJ3MgaG9zdCBzZXJ2ZXItc2lkZSBhbmQgYXZvaWRzIGJyb3dzZXJcbi8vIENPUlMgZHVyaW5nIGBucG0gcnVuIGRldmAuIEluIHByb2R1Y3Rpb24gKFZlcmNlbCksIHRoZSBzYW1lIHBhdGhzIGFyZSBoYW5kbGVkXG4vLyBieSB0aGUgc2VydmVybGVzcyBmdW5jdGlvbnMgaW4gL2FwaSBcdTIwMTQgc28gYXBwIGNvZGUgaXMgaWRlbnRpY2FsIGluIGJvdGguXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpL3Njb3JlYm9hcmQnOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHBzOi8vc2l0ZS5hcGkuZXNwbi5jb20nLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIC8vIC9hcGkvc2NvcmVib2FyZD9kYXRlcz0uLi4gLT4gRVNQTidzIGVuZy4xIHNjb3JlYm9hcmRcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+XG4gICAgICAgICAgcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvc2NvcmVib2FyZC8sICcvYXBpcy9zaXRlL3YyL3Nwb3J0cy9zb2NjZXIvZW5nLjEvc2NvcmVib2FyZCcpLFxuICAgICAgfSxcbiAgICAgICcvYXBpL3N0YW5kaW5ncyc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9zaXRlLmFwaS5lc3BuLmNvbScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgLy8gL2FwaS9zdGFuZGluZ3M/c2Vhc29uPS4uLiAtPiBFU1BOJ3MgZW5nLjEgc3RhbmRpbmdzICh0aGUgcmVhbCBQTCB0YWJsZSlcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+XG4gICAgICAgICAgcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvc3RhbmRpbmdzLywgJy9hcGlzL3YyL3Nwb3J0cy9zb2NjZXIvZW5nLjEvc3RhbmRpbmdzJyksXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1MsU0FBUyxvQkFBb0I7QUFDNVUsT0FBTyxXQUFXO0FBT2xCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxtQkFBbUI7QUFBQSxRQUNqQixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUE7QUFBQSxRQUVkLFNBQVMsQ0FBQyxTQUNSLEtBQUssUUFBUSxzQkFBc0IsOENBQThDO0FBQUEsTUFDckY7QUFBQSxNQUNBLGtCQUFrQjtBQUFBLFFBQ2hCLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQTtBQUFBLFFBRWQsU0FBUyxDQUFDLFNBQ1IsS0FBSyxRQUFRLHFCQUFxQix3Q0FBd0M7QUFBQSxNQUM5RTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
