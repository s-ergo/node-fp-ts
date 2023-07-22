import axios, { AxiosResponse } from "axios";
import * as A from "fp-ts/Array";
import { filter, reduce } from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { flow } from "fp-ts/lib/function";
import "../config/axios.config";
import { Album, Post, Result, User } from "../types";

const getMaxIdObject = <T extends { id: number; userId: number }>(id: number, arr: T[]): T =>
    flow(
        filter((obj: T) => id === obj.userId),
        reduce({ id: null } as T, (max, current) => (max.id > current.id ? max : current))
    )(arr);

const processData = (users: User[], posts: Post[], albums: Album[]): Result[] =>
    users.map(({ id, name, email }) => ({
        id,
        name,
        email,
        post: getMaxIdObject(id, posts),
        album: getMaxIdObject(id, albums),
    }));

const errorLogger = (error: Error) => {
    console.log(error.message);
    // some logging
};

const endpoints = ["users", "posts", "albums"];

const createRequest = (dataType: string): TE.TaskEither<Error, AxiosResponse<any>> =>
    TE.tryCatch(
        () => axios.get(`/${dataType}`),
        (error: unknown) => new Error(`Fetching ${dataType} data. ${(error as Error).message}`)
    );

export const fetchData = (): TE.TaskEither<Error, Result[]> => {
    return pipe(
        A.sequence(TE.ApplicativePar)(endpoints.map(createRequest)),
        TE.mapLeft((error) => {
            errorLogger(error);
            return error;
        }),
        TE.map(([usersRes, postsRes, albumsRes]) => processData(usersRes.data, postsRes.data, albumsRes.data))
    );
};

export const handleResult = (res: any) => (result: E.Either<Error, Result[]>) => {
    if (E.isLeft(result)) {
        res.status(500).send(result.left.message);
    } else {
        res.send(JSON.stringify(result.right));
    }
};
