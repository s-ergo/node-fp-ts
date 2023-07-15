import * as E from "fp-ts/Either";
import "../config/axios.config";

export const handleResult = (res: any) => (result: E.Either<Error, any>) => {
    if (E.isLeft(result)) {
        res.status(500).send(result.left.message);
    } else {
        res.send(JSON.stringify(result.right));
    }
};

export const getObjectWithMaxId = <T extends { id: number }>(arr: T[]): T =>
    arr.reduce((max, current) => (max.id > current.id ? max : current));
