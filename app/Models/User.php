<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Model
{
    protected $table = 'users';
    use HasFactory;
    protected $fillable = ['login', 'password', 'accessToken'];
    public $timestamps = false;
}
