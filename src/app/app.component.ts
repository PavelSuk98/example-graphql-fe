import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';

export const CreateNewPost = gql`
mutation CreateNewPost($title: String!, $text: String!) {
  createPost(input: { title: $title, text: $text}) {
    id,
    title, text, isPublished
  }
}
`;

export const GetPost = gql`
{
  posts {
    id
    title,
    text,
    isPublished
  }
}
`;

export const UpdatePost = gql`
mutation UpdatePost($id: ID!, $title: String!, $text: String!, $isPublished: Boolean) {
  updatePost(input: { id: $id, title: $title, text: $text, isPublished: $isPublished}) {
    id, title, text, isPublished
  }
}
`;

export const RemovePost = gql`
mutation DeletePost($id: ID!) {
  deletePost(id: $id) {
    id, title, text, isPublished
  }
}
`;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  protected readonly fb = inject(FormBuilder);

  protected postToChange: string[] = [];

  posts: any;
  loading = true;
  error: any;

  formGroup = this.fb.group({
    title: new FormControl(undefined, [Validators.required]),
    text: new FormControl(undefined, [Validators.required]),
  })

  constructor(private apollo: Apollo) { }

  ngOnInit() {
    this.apollo
      .watchQuery({
        query: GetPost,
      })
      .valueChanges.subscribe((result: any) => {
        this.posts = result.data?.posts;
        this.loading = result.loading;
        this.error = result.error;
        console.log(this.posts);
      });
  }

  onPostChange(postId: string): void {
    this.postToChange.push(postId);
  }

  onPostChangeCancel(postId: string): void {
    this.postToChange = this.postToChange.filter(id => id !== postId);
  }

  onPostCreate() {
    const data = this.formGroup.getRawValue();
    this.apollo.mutate({ mutation: CreateNewPost, variables: { title: data.title, text: data.text }, refetchQueries: [GetPost] }).subscribe(
      ({ data }) => {
        this.formGroup.reset();
        console.log('got data', data);
      },
      error => {
        console.log('there was an error sending the query', error);
      },
    );
  }

  onPostUpdate(post: any) {
    console.log(post);
    
    this.apollo.mutate<{ updatePost: {id: string}}>({ mutation: UpdatePost, variables: { id: post.id, title: post.title, text: post.text, isPublished: post.isPublished }, refetchQueries: [GetPost] }).subscribe(
      ({ data }) => {

        if(data){
          this.onPostChangeCancel(data.updatePost.id);
        }

        console.log('got data', data);
      },
      error => {
        console.log('there was an error sending the query', error);
      },
    );
    //No Implemented Yet
  }

  onPostDelete(id: string) {
    this.apollo.mutate({ mutation: RemovePost, variables: { id }, refetchQueries: [GetPost] }).subscribe(
      ({ data }) => {
        console.log(data);
        this.formGroup.reset();
        console.log('got data', data);
      },
      error => {
        console.log('there was an error sending the query', error);
      },
    );
  }
}
