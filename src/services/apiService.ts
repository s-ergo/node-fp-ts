import axios from "axios";
import { sequenceT } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { TaskEither } from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import "../config/axios.config";
import { AlbumObject, PostObject, ResultObject, UserObject } from "../types";
import { getObjectWithMaxId } from "../utils";

const processData = (users: UserObject[], posts: PostObject[], albums: AlbumObject[]): ResultObject[] =>
    users.map(({ id, name, email }) => ({
        id,
        name,
        email,
        post: getObjectWithMaxId(posts).title,
        album: getObjectWithMaxId(albums).title,
    }));

export const getData = (): TaskEither<Error, ResultObject[]> => {
    return pipe(
        sequenceT(TE.ApplyPar)(
            TE.tryCatch(
                () => axios.get("/users"),
                (error: unknown) => new Error(`Failed to fetch users data: ${(error as Error).message}`)
            ),
            TE.tryCatch(
                () => axios.get("/posts"),
                (error: unknown) => new Error(`Failed to fetch posts data: ${(error as Error).message}`)
            ),
            TE.tryCatch(
                () => axios.get("/albums"),
                (error: unknown) => new Error(`Failed to fetch albums data: ${(error as Error).message}`)
            )
        ),
        TE.map(([usersRes, postsRes, albumsRes]) => processData(usersRes.data, postsRes.data, albumsRes.data))
    );
};
