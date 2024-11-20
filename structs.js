import * as s from "superstruct";

export const CreateInvest = s.object({
    name: s.string(),
    investAmount: s.number(),
    comment : s.string(),
    password : s.string()
});

export const PatchInvest = s.partial(CreateInvest);