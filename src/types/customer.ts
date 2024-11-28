import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
export class Customer {
  @Field(() => Int)
  id: number = 0;

  @Field({ nullable: true })
  firstname?: string | null;

  @Field({ nullable: true })
  lastname?: string | null;

  @Field({ nullable: true })
  gender?: string | null;

  @Field({ nullable: true })
  email?: string | null;

  @Field({ nullable: true })
  dateofbirth?: Date | null;

  @Field()
  created?: Date | null;

  @Field()
  updated?: Date | null;
}
