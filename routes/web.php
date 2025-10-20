<?php

/**
 *        SeUnem - A free software platform for participatory decision-making and
 *        collective event management.
 *        Copyright (C) 2025  João Augusto Costa Branco Marado Torres
 *        <torres.dev@disroot.org>
 *
 *        This file is part of SeUnem.
 *
 *        SeUnem is free software: you can redistribute it and/or modify it under the
 *        terms of the GNU Affero General Public License as published by the Free
 *        Software Foundation, either version 3 of the License, or (at your option) any
 *        later version.
 *
 *        SeUnem is distributed in the hope that it will be useful, but WITHOUT ANY
 *        WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 *        A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more
 *        details.
 *
 *        You should have received a copy of the GNU Affero General Public License
 *        along with SeUnem.  If not, see <https://www.gnu.org/licenses/>
 *
 * @author João Augusto Costa Branco Marado Torres <torres.dev@disroot.org>
 * @copyright Copyright (C) 2025  João Augusto Costa Branco Marado Torres
 * @license https://www.gnu.org/licenses/agpl-3.0.txt GNU Affero General Public License
 * @license https://opensource.org/licenses/AGPL-3.0 GNU Affero General Public License version 3
 */

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render("welcome", ["user" => ["name" => "user"]]);
});
