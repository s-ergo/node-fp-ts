import axios, { AxiosResponse } from "axios";
import * as A from "fp-ts/Array";
import { filter, map, reduce } from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { flow } from "fp-ts/lib/function";
import "../config/axios.config";
import { Album, CustomError, Post, Result, User } from "../types";

const getMaxIdObject = <T extends { id: number; userId: number }>(id: number, arr: T[]): T =>
    flow(
        filter((obj: T) => id === obj.userId),
        reduce({ id: null } as T, (max, current) => (max.id > current.id ? max : current))
    )(arr);

const createUserResult =
    (posts: Post[], albums: Album[]) =>
    ({ id, name, email }: User): Result => ({
        id,
        name,
        email,
        post: getMaxIdObject(id, posts),
        album: getMaxIdObject(id, albums),
    });

const processData = (users: User[], posts: Post[], albums: Album[]): Result[] =>
    flow(map(createUserResult(posts, albums)))(users);

const handleError = (error: any): CustomError => {
    const customError: CustomError = new Error(error.message);
    customError.message = error.message ?? "Something went wrong";
    customError.status = error.response?.status ?? 500;
    return customError;
};

const endpoints = ["u1sers", "posts", "albums"];

const createRequest = (dataType: string): TE.TaskEither<Error, AxiosResponse<any>> =>
    TE.tryCatch(
        () => axios.get(`/${dataType}`),
        (error: unknown) => error as Error
    );

export const fetchData = (): TE.TaskEither<Error, Result[]> =>
    flow(
        map(createRequest),
        A.sequence(TE.ApplicativePar),
        TE.mapLeft((error) => handleError(error)),
        TE.map(([usersRes, postsRes, albumsRes]) => processData(usersRes.data, postsRes.data, albumsRes.data))
    )(endpoints);

export const handleResult = (res: any) => (result: E.Either<CustomError, Result[]>) => {
    if (E.isLeft(result)) {
        res.status(result.left.status).send(result.left.message);
    } else {
        res.send(JSON.stringify(result.right));
    }
};
