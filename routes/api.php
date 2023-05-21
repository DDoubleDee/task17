<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Project;
use App\Models\Element;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post("/login", function (Request $request) {
    $user = User::where('login', $request->input('login'))->get()->first();
    if($user || strlen($request->input('pid')) < 4){
        if($user->password == $request->input('pid')){
            $user->accessToken = Str::random(100);
            $user->save();
            return response(["data" => ["token" => $user->accessToken]], 200)->header('Content-Type', 'application/json');
        }
        return response(["errors" => ["pin" => "Incorrect pin-code"]], 422)->header('Content-Type', 'application/json');
    }else{
        $user = User::create();
        $user->login = $request->input('login');
        $user->password = $request->input('pid');
        $user->accessToken = Str::random(100);
        $user->save();
        return response(["data" => ["token" => $user->accessToken]], 200)->header('Content-Type', 'application/json');
    }
});
Route::get("/projects", function (Request $request) {
    $user = User::where('accessToken', $request->bearerToken())->get()->first();
    if(!$user){
        return response(["errors" => ["message" => "Unauthorized"]], 401)->header('Content-Type', 'application/json');
    }
    $out = array();
    $projects = Project::where('creator_id', $user->id)->get()->toArray();
    for ($i=0; $i < count($projects); $i++) { 
        $out[$i] = ["id" => $projects[$i]["id"], "name" => $projects[$i]["name"]];
    }
    return response(["data" => $out], 200)->header('Content-Type', 'application/json');
});
Route::get("/projects/{id}", function (Request $request, $id) {
    $user = User::where('accessToken', $request->bearerToken())->get()->first();
    if(!$user){
        return response(["errors" => ["message" => "Unauthorized"]], 401)->header('Content-Type', 'application/json');
    }
    $project = Project::where(["id" => $id, "creator_id" => $user->id])->get()->first();
    if(!$project){
        return response(["errors" => ["message" => "Does not exist"]], 404)->header('Content-Type', 'application/json');
    }
    $out = ["id" => $project->id, "name" => $project->name, "content" => json_decode($project->content)];
    return response(["data" => $out], 200)->header('Content-Type', 'application/json');
});
Route::post("/projects", function (Request $request) {
    $user = User::where('accessToken', $request->bearerToken())->get()->first();
    if(!$user){
        return response(["errors" => ["message" => "Unauthorized"]], 401)->header('Content-Type', 'application/json');
    }
    $project = Project::create(["name" => "New Project", "content" => "{}", "creator_id" => $user->id]);
    $out = ["id" => $project->id, "name" => $project->name, "content" => json_decode("{}")];
    return response(["data" => [$out]], 201)->header('Content-Type', 'application/json');
});
Route::patch("/projects/{id}", function (Request $request, $id) {
    $user = User::where('accessToken', $request->bearerToken())->get()->first();
    if(!$user){
        return response(["errors" => ["message" => "Unauthorized"]], 401)->header('Content-Type', 'application/json');
    }
    $project = Project::where(["id" => $id, "creator_id" => $user->id])->get()->first();
    if(!$project){
        return response(["errors" => ["message" => "Does not exist"]], 404)->header('Content-Type', 'application/json');
    }
    $name = $request->input("name");
    if(is_null($name)){
        $name = $project->name;
    }
    $project->name = $name;
    $content = $request->input("content");
    if($content){
        $project->content = json_encode($content);
    }
    $project->save();
    $out = ["id" => $project->id, "name" => $project->name, "content" => json_decode($project->content)];
    return response(["data" => $out], 200)->header('Content-Type', 'application/json');
});
Route::get("/elements", function (Request $request) {
    $elements = Element::get();
    return response(["data" => $elements], 200)->header('Content-Type', 'application/json');
});