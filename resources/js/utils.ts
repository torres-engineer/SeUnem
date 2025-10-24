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
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
