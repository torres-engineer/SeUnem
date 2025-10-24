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

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render("welcome", ["user" => ["name" => "user"]]);
});

$events = [];
$commonTags = ['community', 'music', 'tech', 'art', 'education', 'environment'];

for ($i = 0; $i < 20; $i++) {
    $members = fake()->numberBetween(10, 1000);
    $events[] = [
        "title" => fake()->sentence(rand(3, 6)),
        "status" => fake()->randomElement(['upcoming', 'cancelled', 'completed']),
        "description" => fake()->paragraph(),
        "start" => fake()->dateTimeBetween('-1 month', '+3 months')->format('Y-m-d\TH:i'),
        "location" => ["name" => fake()->city()],
        "memberCount" => $members,
        "followerCount" => fake()->numberBetween($members, 1000),
        "tags" => array_map(fn ($x) => ["name" => $x], fake()->randomElements($commonTags, rand(2, 4))),
    ];
}

Route::get('/events', function (Request $req) use ($events, $commonTags) {
    $tags = $req->query('tags', []);
    if (!is_array($tags)) {
        $tags = [$tags];
    }

    $filtered = array_values(array_filter(
        $events,
        fn($event) => array_all(
            $tags,
            fn($tag) => array_any(
                $event["tags"],
                fn($t) => strcmp($t["name"], $tag) === 0
            )
        )
    ));

    $tagsFromFiltered = collect($filtered)
        ->flatMap(fn($event) => $event['tags'])
        ->unique()
        ->reject(fn($tag) => in_array($tag, $tags))
        ->values()
        ->all();

    return Inertia::render("events", [
        "events" => $filtered,
        "tags" => count($tags) > 0 ? $tagsFromFiltered : [],
    ]);
});

Route::get('/event-groups', function () use ($events, $commonTags) {
    return Inertia::render("event_groups", [
        "availableGroups" => array_map(
            fn($x) => [
                "name" => $x,
                "count" => count(array_filter(
                    $events,
                    fn($y) => array_any(
                        $y["tags"],
                        fn($t) => strcmp($t["name"], $x) === 0
                    )
                ))
            ],
            $commonTags
        ),
    ]);
});
