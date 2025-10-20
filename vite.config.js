/**
 *    SeUnem - A free software platform for participatory decision-making and
 *    collective event management.
 *    Copyright (C) 2025  João Augusto Costa Branco Marado Torres
 *    <torres.dev@disroot.org>
 *
 *    This file is part of SeUnem.
 *
 *    SeUnem is free software: you can redistribute it and/or modify it under
 *    the terms of the GNU Affero General Public License as published by the
 *    Free Software Foundation, either version 3 of the License, or (at your
 *    option) any later version.
 *
 *    SeUnem is distributed in the hope that it will be useful, but WITHOUT ANY
 *    WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 *    FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for
 *    more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with SeUnem.  If not, see <https://www.gnu.org/licenses/>
 */
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [
    laravel({
      input: ["resources/css/app.css", "resources/js/app.js"],
      ssr: "resources/js/ssr.js",
      refresh: true,
    }),
    tailwindcss(),
    svelte(),
  ],
  resolve: (name) => {
    const pages = import.meta.glob("./Pages/**/*.svelte", { eager: true });

    return pages[`./Pages/${name}.svelte`];
  },
});
