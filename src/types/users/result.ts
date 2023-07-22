import { Album } from "./album";
import { Post } from "./post";

export type Result = {
    id: number;
    name: string;
    email: string;
    post: Post;
    album: Album;
};
